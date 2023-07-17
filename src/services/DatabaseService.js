import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";
import JSEvent from "../utils/JSEvent";
import { DataEvents } from "../modules/Events";
import DataCenter from "../modules/DataCenter";
import Message from "../Models/Message";
import MessageData from "../Models/MessageData";
import { ChatListItem } from "../Models/MessageCaches";
import { Notification, Notifications } from "../Models/Notifications";
import { LesConstants } from "les-im-components";
import ChatGroup from "../Models/ChatGroup";

const db_version = "1.0";

const ERROR_DB_ISNULL = "ERROR_DB_ISNULL";

export default class DatabaseService {
  static #inst;

  /**
   * @type {SQLite.WebSQLDatabase}
   */
  #currDb;

  /**
   * @returns {DatabaseService}
   */
  static get Inst() {
    return DatabaseService.#inst ?? new DatabaseService();
  }

  constructor() {
    if (new.target !== DatabaseService) return;
    if (DatabaseService.#inst == null) {
      DatabaseService.#inst = this;
    }
    return DatabaseService.#inst;
  }

  init() {
    JSEvent.on(DataEvents.User.UserState_IsLoggedin, () => {
      //用户登陆以后，打开用户对应的数据库
      this.#openDatabase(DataCenter.userInfo.accountId);
    });
  }

  async #openDatabase(userId) {
    this.#currDb = SQLite.openDatabase(`les-db-${userId}`);
    try {
      const version = await this.#getVersion();
      //先尝试建数据库，把没有的数据表创建出来
      try {
        await this.#createDatabase(false);
      } catch (e) {
        console.error("create database failed:", e);
      }
      if (version != db_version) {
        this.#updateDatabase(version);
      }
      JSEvent.emit(DataEvents.User.UserState_DataReady);
    } catch (error) {
      if (error == ERROR_DB_ISNULL) {
        console.error(`database[les-db-${userId}] load error`);
        JSEvent.emit(DataEvents.User.UserState_DataReady);
      } else {
        //数据库不存在，创建
        console.log(`creating database : les-db-${userId}`);
        this.#createDatabase().then(() => {
          JSEvent.emit(DataEvents.User.UserState_DataReady);
        });
      }
    }
    // this.#getVersion()
    //     .then(version => {
    //         console.log("current database version:" + version);
    //         if (version != db_version) {
    //             this.#updateDatabase(version);
    //         }
    //         JSEvent.emit(DataEvents.User.UserState_DataReady);
    //     }).catch(error => {
    //         if (error == ERROR_DB_ISNULL) {
    //             console.error(`database[les-db-${userId}] load error`)
    //         } else {
    //             //数据库不存在，创建
    //             console.log(`creating database : les-db-${userId}`)
    //             this.#createDatabase();
    //         }
    //         JSEvent.emit(DataEvents.User.UserState_DataReady);
    //     });
  }

  /**
   *
   * @param {SQLite.SQLTransaction} tx
   * @param {string} sql
   * @param {SQLite.SQLResultSet | null} values
   */
  #transactionPromise(tx, sql, values) {
    return new Promise((reslove, reject) => {
      tx.executeSql(
        sql,
        values,
        (_, result) => {
          //console.log(`sql ${sql} succ`, result)
          reslove(result);
        },
        (_, error) => {
          console.log(`sql ${sql} err `, error);
          reject(error);
        }
      );
    });
  }

  /**
   * 返回当前数据库的版本号，如果是新数据库，返回null
   * @returns {Promise<SQLite.SQLTransaction>}
   */
  #getVersion() {
    return new Promise((reslove, reject) => {
      if (this.#currDb == null) reject(ERROR_DB_ISNULL);
      this.#currDb.transaction(async (tx) => {
        try {
          const result = await this.#transactionPromise(
            tx,
            "select * from tbl_config where id = 1",
            null
          );
          const v = result.rows.item(0);
          if (v == null) {
            reject("");
          } else {
            reslove(v.version);
          }
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  #createDatabase(createTblVersion = true) {
    return new Promise((reslove) => {
      this.#currDb.transaction(async (tx) => {
        let ps = [];
        if (createTblVersion) ps.push(this.#createTblVersion(tx));
        ps.push(this.#createTables(tx));
        try {
          await Promise.all(ps);
        } catch (e) {
          console.error(e);
        }
        reslove();
      });
    });
  }

  #createTables(tx) {
    let ps = [];
    ps.push(this.#createTblMessage(tx));
    ps.push(this.#createTblChatGroup(tx));
    ps.push(this.#createTblChatlist(tx));
    ps.push(this.#createTblNotification(tx));
    return Promise.all(ps);
  }

  #createTblVersion(tx) {
    //tbl_config表
    let ps = [];
    ps.push(
      this.#transactionPromise(
        tx,
        `create table if not exists tbl_config(
                    id integer primary key not null ,
                    version nvarchar not null,
                    latestTimelineId integer not null
                );`,
        null
      )
    );
    ps.push(
      this.#transactionPromise(tx, `insert into tbl_config values(1, ?, 0)`, [
        db_version,
      ])
    );
    return Promise.all(ps);

    // tx.executeSql(
    //     `create table if not exists tbl_config(
    //             id integer primary key not null ,
    //             version nvarchar not null,
    //             latestTimelineId integer not null
    //         );`, null,
    //     (s, result) => {
    //         console.log(result);
    //     }, (s, error) => {
    //         console.log(error);
    //     });

    // tx.executeSql(
    //     `insert into tbl_config values(1, ?, 0)`, [db_version], (s, result) => {
    //         console.log(result);
    //     }, (s, error) => {
    //         console.log(error);
    //     }
    // );
  }

  /**
   * 这个表格用于存储各个群聊的信息、
   */
  #createTblChatGroup(tx) {
    let ps = [];
    ps.push(this.#transactionPromise(
      tx,
      `create table if not exists tbl_chatgroup(
                    groupId INTEGER PRIMARY KEY NOT NULL,
                    name nvarchar NOT NULL,
                    desc nvarchar NOT NULL,
                    creator INTEGER NOT NULL,
                    createTime INTEGER NOT NULL,
                    iconId INTEGER NOT NULL,
                    latestTimelineId INTEGER NOT NULL
      )`
    ));

    ps.push(
      this.#transactionPromise(
        tx,
        `create index if not exists index_chatgroup_creator on tbl_chatgroup(creator);`
      )
    );
    return Promise.all(ps);
  }

  #createTblMessage(tx) {
    let ps = [];
    ps.push(
      this.#transactionPromise(
        tx,
        `create table if not exists tbl_message(
                    messageId INTEGER PRIMARY KEY NOT NULL,
                    timelineId INTEGER NOT NULL,
                    senderId INTEGER NOT NULL,
                    recipientId INTEGER NOT NULL,
                    messageType INTEGER NOT NULL,
                    groupId INTEGER,
                    timestamp INTEGER NOT NULL,
                    contentType INTEGER NOT NULL,
                    content nvarchar NOT NULL
                );`
      )
    );

    ps.push(
      this.#transactionPromise(
        tx,
        `create index if not exists index_message_timelineId on tbl_message(timelineId);`
      )
    );
    ps.push(
      this.#transactionPromise(
        tx,
        `create index if not exists index_message_senderId on tbl_message(senderId);`
      )
    );
    ps.push(
      this.#transactionPromise(
        tx,
        `create index if not exists index_message_recipientId on tbl_message(recipientId);`
      )
    );
    ps.push(
      this.#transactionPromise(
        tx,
        `create index if not exists index_message_groupId on tbl_message(groupId);`
      )
    );
    return Promise.all(ps);
  }

  /**
   *
   * @param {SQLite.SQLTransaction} tx
   */
  #createTblChatlist(tx) {
    return this.#transactionPromise(
      tx,
      `create table if not exists tbl_chatlist(
                    chatId varchar primary key not null,
                    targetId integer not null,
                    type integer not null,
                    newMessageCount integer not null,
                    updateTime integer not null,
                    latestMessage nvarchar not null
                );`
    );
  }

  /**
   *
   * @param {SQLite.SQLTransaction} tx
   */
  #createTblNotification(tx) {
    return this.#transactionPromise(
      tx,
      `create table if not exists tbl_notifications(
                id integer primary key not null,
                type integer not null,
                senderId integer not null,
                senderName nvarchar,
                senderTag integer not null,
                recipientId integer not null,
                recipientName nvarchar,
                recipientTag integer not null,
                state integer not null,
                time integer not null,
                groupId integer not null,
                groupName nvarchar,
                content nvarchar
            );`
    );
  }

  #updateDatabase(version) {
    // if (version == "1.0") {
    //     this.#currDb.transaction(tx => {
    //         tx.executeSql(
    //             `create table if not exists tbl_chatlist(
    //             chatId varchar primary key not null,
    //             targetId integer not null,
    //             type integer not null,
    //             newMessageCount integer not null,
    //             updateTime integer not null,
    //             latestMessage nvarchar not null
    //         );`);
    //     })
    // }
    // this.#currDb.transaction(tx => {
    //     tx.executeSql(
    //         `update tbl_version set version = ? where id = 1`, [db_version], (_, r) => { console.log(r) }, (_, e) => { console.log(e) })
    // })
  }

  /**
   * 保存或者更新chatGroup数据
   * @param {ChatGroup} chatGroup 
   */
  saveChatGroup(chatGroup) {
    return new Promise((resolve, reject) => {
      if (this.#currDb == null) reject(ERROR_DB_ISNULL);

      const { id, name, desc, creator, createTime, iconId, latestTimelineId } = chatGroup;

      this.#currDb.transaction((tx) => {
        tx.executeSql(
          `select groupId from tbl_chatgroup where groupId = ?`,
          [chatGroup.id],
          (statement, r) => {
            let sql = "insert into tbl_chatgroup values (?,?,?,?,?,?,?)";
            let values = [id, name, desc, creator, createTime, iconId, latestTimelineId];

            if (r.rows != null && r.rows._array.length > 0) {
              //已有数据，更新
              sql = "update tbl_chatgroup set name = ?, desc = ?, creator = ?, createTime = ?, iconId = ?, latestTimelineId = ? where groupId = ?";
              values = [name, desc, creator, createTime, iconId, latestTimelineId, id];
            }

            tx.executeSql(
              sql,
              values,
              (statement, result) => {
                resolve(result);
              },
              (statement, error) => {
                reject(error);
              }
            );

          },
          (statement, error) => {
            reject(error);
          }
        )
      })

    });
  }

  /**
   * 将消息存入数据库
   * @param {MessageData} message
   * @returns {Promise}
   */
  saveMessage(message) {
    return new Promise((resolve, reject) => {
      if (this.#currDb == null) reject(ERROR_DB_ISNULL);
      const {
        messageId,
        timelineId,
        senderId,
        recipientId,
        messageType,
        groupId,
        timestamp,
        contentType,
        content,
      } = message;
      this.#currDb.transaction((tx) => {
        tx.executeSql(
          "select messageId from tbl_message where messageId = ?",
          [messageId],
          (statement, r) => {
            let sql = "insert into tbl_message values(?,?,?,?,?,?,?,?,?)";
            let values = [
              messageId,
              timelineId,
              senderId,
              recipientId,
              messageType,
              groupId,
              timestamp,
              contentType,
              content,
            ];
            if (r.rows != null && r.rows._array.length > 0) {
              //已有数据，更新
              sql = `update tbl_message set timelineId = ?, senderId = ?, recipientId = ?, messageType = ?, 
                        groupId = ?, timestamp = ?, contentType = ?, content = ? where messageId = ?`;
              values = [
                timelineId,
                senderId,
                recipientId,
                messageType,
                groupId,
                timestamp,
                contentType,
                content,
                messageId,
              ];
            }
            tx.executeSql(
              sql,
              values,
              (statement, result) => {
                resolve(result);
              },
              (statement, error) => {
                reject(error);
              }
            );
          },
          (statement, error) => {
            reject(error);
          }
        );
      });
    });
  }

  /**
   * Searches chat history for a keyword.
   * @param {string} keyword
   * @returns {Promise}
   */
  searchChatHistory(keyword) {
    return new Promise((resolve, reject) => {
      if (this.#currDb == null) reject(ERROR_DB_ISNULL);
      this.#currDb.transaction((tx) => {
        tx.executeSql(
          "SELECT * FROM tbl_message WHERE content LIKE ?",
          [`%${keyword}%`],
          (statement, result) => {
            let messages = [];
            for (let i = 0; i < result.rows.length; i++) {
              messages.push(result.rows.item(i));
            }
            resolve(messages);
          },
          (statement, error) => {
            reject(error);
          }
        );
      });
    });
  }

  /**
   * 将消息列表存入数据库
   * @param {ChatListItem[]} chatlist;
   */
  saveChatList(chatlist) {
    if (this.#currDb == null) return null;
    this.#currDb.transaction((tx) => {
      chatlist.forEach((chat) => {
        this.#saveChatListItem(tx, chat);
      });
    });
  }

  saveChatListItem(item) {
    if (this.#currDb == null) return null;
    this.#currDb.transaction((tx) => {
      this.#saveChatListItem(tx, item);
    });
  }

  saveTimelineId(timelineId) {
    if (this.#currDb == null) return null;
    this.#currDb.transaction((tx) => {
      tx.executeSql("update tbl_config set latestTimelineId = ? where id = 1", [
        timelineId,
      ]);
    });
  }

  loadTimelineId() {
    return new Promise((reslove) => {
      if (this.#currDb == null) {
        reslove(0);
        return;
      }
      this.#currDb.transaction((tx) => {
        tx.executeSql(
          "select latestTimelineId from tbl_config where id = 1",
          null,
          (_, r) => {
            if (r.rows.length > 0) {
              const id = r.rows.item(0).latestTimelineId;
              if (id == null) {
                reslove(0);
              } else {
                reslove(id);
              }
            }
          },
          (_, e) => {
            reslove(0);
          }
        );
      });
    });
  }

  /**
   * Load 5 messages preceding and all messages following the specific timelineId
   * @param {number} timelineId
   * @returns {Promise<Array>}
   */
  /*
  loadMessagesFromTimelineId(timelineId) {
    return new Promise((resolve, reject) => {
      if (this.#currDb == null) reject(ERROR_DB_ISNULL);
      this.#currDb.transaction((tx) => {
        tx.executeSql(
          "SELECT * FROM tbl_message WHERE timelineId <= ? ORDER BY timelineId DESC LIMIT 6",
          [timelineId],
          (tx, result) => {
            let messages = [];
            for (let i = 0; i < result.rows.length; i++) {
              messages.push(result.rows.item(i));
            }
            messages = messages.reverse(); // Reverse the messages for correct display

            // Then retrieve all messages after that timelineId
            tx.executeSql(
              "SELECT * FROM tbl_message WHERE timelineId > ? ORDER BY timelineId ASC",
              [timelineId],
              (tx, result2) => {
                for (let i = 0; i < result2.rows.length; i++) {
                  messages.push(result2.rows.item(i));
                }
                resolve(messages);
              },
              (tx, error) => {
                reject(error);
              }
            );
          },
          (tx, error) => {
            reject(error);
          }
        );
      });
    });
  }
  */

  /**
   * @param {SQLite.SQLTransaction} tx
   * @param {ChatListItem} chat
   */
  #saveChatListItem(tx, chat) {
    tx.executeSql(
      "select chatId from tbl_chatlist where chatId = ?",
      [chat.chatId],
      (_, r) => {
        let sql = "insert into tbl_chatlist values(?,?,?,?,?,?)";
        let value = [
          chat.chatId,
          chat.targetId,
          chat.type,
          chat.newMessageCount,
          chat.updateTime,
          chat.latestMessage,
        ];
        if (r.rows.length > 0) {
          sql =
            "update tbl_chatlist set targetId = ?, type = ?, newMessageCount = ?, updateTime = ?, latestMessage = ? where chatId = ?";
          value = [
            chat.targetId,
            chat.type,
            chat.newMessageCount,
            chat.updateTime,
            chat.latestMessage,
            chat.chatId,
          ];
        }
        tx.executeSql(sql, value, (_, r) => {
          console.log("chatlist saved", r),
            (_, e) => console.log("chatlist saved error:", e);
        });
      },
      (_, e) => {
        console.log(`save chatlist[${chat.chatId}] error: ${e}`);
      }
    );
  }

  /**
   * 读取对话列表
   * @returns {Promise<ChatListItem[]>}
   */
  loadChatList() {
    return new Promise((resolve, reject) => {
      if (this.#currDb == null) reject(ERROR_DB_ISNULL);
      this.#currDb.transaction((tx) => {
        tx.executeSql(
          "select * from tbl_chatlist",
          null,
          (_, r) => {
            let ret = [];
            for (let i = 0; i < r.rows.length; i++) {
              const item = r.rows.item(i);
              const chatListItem = new ChatListItem(item.chatId);
              chatListItem.init(
                item.targetId,
                item.type,
                item.newMessageCount,
                item.updateTime,
                item.latestMessage
              );
              ret.push(chatListItem);
            }
            resolve(ret);
          },
          (_, e) => {
            console.error("load chatlist error:", e);
            reject(e);
          }
        );
      });
    });
  }

  /**
   * 读取聊天群组数据
   * @returns {Promise<ChatGroup[]>}
   */
  loadChatGroup() {
    return new Promise((resolve, reject) => {
      if (this.#currDb == null) reject(ERROR_DB_ISNULL);
      this.#currDb.transaction((tx) => {
        tx.executeSql(
          "select * from tbl_chatgroup",
          null,
          (_, r) => {
            let ret = [];
            for (let i = 0; i < r.rows.length; i++) {
              const item = r.rows.item(i);
              const cg = new ChatGroup();

              cg.id = item.groupId;
              cg.name = item.name;
              cg.desc = item.desc;
              cg.creator = item.creator;
              cg.createTime = item.createTime;
              cg.iconId = item.iconId;
              cg.latestTimelineId = item.latestTimelineId;

              ret.push(cg);
            }
            resolve(ret);
          },
          (_, e) => {
            console.error("load chatlist error:", e);
            reject(e);
          }
        );
      });
    })
  }

  loadMessage() {
    return new Promise((resolve, reject) => {
      if (this.#currDb == null) reject(ERROR_DB_ISNULL);
      this.#currDb.transaction((tx) => {
        tx.executeSql(
          "select * from tbl_message",
          null,
          (statement, r) => {
            console.log(r);
            resolve(r);
          },
          (s, error) => {
            reject(error);
          }
        );
      });
    });
  }

  /**
   * Load all messages from the database
   * @todo 控制载入的消息数量
   * @returns {Promise}
   */
  loadAllMessages() {
    return new Promise((resolve, reject) => {
      if (this.#currDb == null) reject(ERROR_DB_ISNULL);
      this.#currDb.transaction((tx) => {
        tx.executeSql(
          "select * from tbl_message",
          [],
          (statement, result) => {
            let messages = [];
            for (let i = 0; i < result.rows.length; i++) {
              messages.push(result.rows.item(i));
            }
            resolve(messages);
          },
          (statement, error) => {
            reject(error);
          }
        );
      });
    });
  }

  /**
   * 从数据库中移除计划列表
   * @param {SQLite.SQLTransaction} tx
   * @param {string} chatId
   */
  #removeChatListItem(tx, chatId) {
    tx.executeSql(
      "DELETE FROM tbl_chatlist WHERE chatId = ?",
      [chatId],
      (_, r) => {
        console.log(`chatlist item with chatId ${chatId} removed`, r);
      },
      (_, e) => {
        console.log(`remove chatlist item[${chatId}] error: ${e}`);
      }
    );
  }

  /**
   * 从数据库中移除chatId对应的对话列表
   * @param {string} chatId
   * @returns {Promise}
   */
  removeChatListItem(chatId) {
    if (this.#currDb == null) return null;
    this.#currDb.transaction((tx) => {
      this.#removeChatListItem(tx, chatId);
    });
  }

  /**
   *
   * @param {Notification} noti
   */
  saveNotification(noti) {
    if (this.#currDb == null) return null;
    this.#currDb.transaction((tx) => {
      this.#saveNotification(tx, noti);
    });
  }

  /**
   *
   * @param {SQLite.SQLResultSet} result
   */
  #parseNotificationFromDb(result) {
    let ret = [];
    for (let i = 0; i < result.rows.length; i++) {
      const item = result.rows.item(i);
      const noti = new Notification();
      noti.id = item.id;
      noti.type = item.type;
      noti.sender = {
        id: item.senderId,
        name: item.senderName,
        tag: item.senderTag,
      };
      noti.recipient = {
        id: item.recipientId,
        name: item.recipientName,
        tag: item.recipientTag,
      };
      noti.state = item.state;
      noti.time = item.time;
      noti.groupInfo = { id: item.groupId, name: item.groupName };
      noti.content = item.content;
      ret.push(noti);
    }
    return ret;
  }

  /**
   * 读取所有未响应的通知消息
   * @returns {Notifications[]}
   */
  loadNotifications() {
    return new Promise((reslove, reject) => {
      if (this.#currDb == null) {
        reject(ERROR_DB_ISNULL);
        return;
      }
      this.#currDb.transaction(async (tx) => {
        try {
          const result = await this.#transactionPromise(
            tx,
            `select * from tbl_notifications where state < ?`,
            [LesConstants.IMNotificationState.Accepted]
          );
          reslove(this.#parseNotificationFromDb(result));
        } catch (e) {
          console.error("load notifications error,", e);
          reject(e);
        }
      });
    });
  }

  /**
   *
   * @param {SQlite.SQLTransaction} tx
   * @param {Notification} noti
   */
  #saveNotification(tx, noti) {
    tx.executeSql(
      `select id from tbl_notifications where id = ?`,
      [noti.id],
      (_, succ) => {
        let sql =
          "insert into tbl_notifications values(?,?,?,?,?,?,?,?,?,?,?,?,?)";
        let value = [
          noti.id,
          noti.type,
          noti.sender.id,
          noti.sender.name,
          noti.sender.tag,
          noti.recipient.id,
          noti.recipient.name,
          noti.recipient.tag,
          noti.state,
          noti.time,
          noti.groupInfo.id,
          noti.groupInfo.name,
          noti.content,
        ];

        if (succ.rows.length > 0) {
          //update
          sql =
            "update tbl_notifications set type = ?, senderId=?,senderName=?,senderTag=?,recipientId=?,recipientName=?,recipientTag=?,state=?,time=?,groupId=?,groupName=?,content=? where id = ?";
          value = [
            noti.type,
            noti.sender.id,
            noti.sender.name,
            noti.sender.tag,
            noti.recipient.id,
            noti.recipient.name,
            noti.recipient.tag,
            noti.state,
            noti.time,
            noti.groupInfo.id,
            noti.groupInfo.name,
            noti.content,
            noti.id,
          ];
        }

        tx.executeSql(
          sql,
          value,
          (_, succ) => {
            console.log("notification saved", noti);
          },
          (_, error) => {
            console.error("notification saved error", noti, error);
          }
        );
      },
      (_, e) => {
        console.error(`save notification [${noti.id}] error: `, e);
      }
    );
  }
}
