import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";
import JSEvent from "../utils/JSEvent";
import { DataEvents } from "../modules/Events";
import DataCenter from "../modules/DataCenter";
import Message from "../Models/Message";
import MessageData from "../Models/MessageData";
import { ChatListItem } from "../Models/MessageCaches";

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
        })
    }

    async #openDatabase(userId) {
        this.#currDb = SQLite.openDatabase(`les-db-${userId}`);

        try {
            const version = await this.#getVersion();
            if (version != db_version) {
                this.#updateDatabase(version);
            }
            JSEvent.emit(DataEvents.User.UserState_DataReady);
        } catch (error) {
            if (error == ERROR_DB_ISNULL) {
                console.error(`database[les-db-${userId}] load error`)
                JSEvent.emit(DataEvents.User.UserState_DataReady);
            } else {
                //数据库不存在，创建
                console.log(`creating database : les-db-${userId}`)
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
     * @param {object[] | null} values 
     */
    #transactionPromise(tx, sql, values) {
        return new Promise((reslove, reject) => {
            tx.executeSql(sql, values,
                (_, result) => {
                    //console.log(`sql ${sql} succ`, result)
                    reslove(result)
                },
                (_, error) => {
                    //console.log(`sql ${sql} err `, error)
                    reject(error)
                });
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
                    const result = await this.#transactionPromise(tx, "select * from tbl_config where id = 1", null)
                    const v = result.rows.item(0);
                    if (v == null) {
                        reject("");
                    } else {
                        reslove(v.version);
                    }
                } catch (e) {
                    reject(e);
                }
            })
        })
    }

    #createDatabase() {
        return new Promise((reslove) => {
            this.#currDb.transaction(async (tx) => {
                let ps = [];
                ps.push(this.#createTblVersion(tx));
                ps.push(this.#createTblMessage(tx));
                ps.push(this.#createTblChatlist(tx));
                try {
                    await Promise.all(ps);
                } catch (e) {
                    console.error(e);
                }
                reslove();
            })
        })
    }

    #createTblVersion(tx) {
        //tbl_config表
        let ps = [];
        ps.push(this.#transactionPromise(tx, `create table if not exists tbl_config(
                    id integer primary key not null ,
                    version nvarchar not null,
                    latestTimelineId integer not null
                );`, null));
        ps.push(this.#transactionPromise(tx, `insert into tbl_config values(1, ?, 0)`, [db_version]));
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

    #createTblMessage(tx) {
        let ps = [];
        ps.push(this.#transactionPromise(tx,
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
        ));

        ps.push(this.#transactionPromise(tx, `create index index_message_timelineId on tbl_message(timelineId);`));
        ps.push(this.#transactionPromise(tx, `create index index_message_senderId on tbl_message(senderId);`));
        ps.push(this.#transactionPromise(tx, `create index index_message_recipientId on tbl_message(recipientId);`));
        ps.push(this.#transactionPromise(tx, `create index index_message_groupId on tbl_message(groupId);`))
        return Promise.all(ps);
    }
    /**
     * 
     * @param {SQLite.SQLTransaction} tx 
     */
    #createTblChatlist(tx) {
        return this.#transactionPromise(tx,
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
     * 将消息存入数据库
     * @param {MessageData} message 
     * @returns {Promise}
     */
    saveMessage(message) {
        return new Promise((resolve, reject) => {
            if (this.#currDb == null) reject(ERROR_DB_ISNULL);
            const { messageId, timelineId, senderId, recipentId, messageType, groupId, timestamp, contentType, content } = message;
            this.#currDb.transaction(tx => {
                tx.executeSql("select messageId from tbl_message where messageId = ?", [messageId], (statement, r) => {
                    let sql = "insert into tbl_message values(?,?,?,?,?,?,?,?,?)";
                    let values = [messageId, timelineId, senderId, recipentId, messageType, groupId, timestamp, contentType, content];
                    if (r.rows != null && r.rows._array.length > 0) {
                        //已有数据，更新
                        sql = `update tbl_message set timelineId = ?, senderId = ?, recipientId = ?, messageType = ?, 
                        groupId = ?, timestamp = ?, contentType = ?, content = ? where messageId = ?`;
                        values = [timelineId, senderId, recipentId, messageType, groupId, timestamp, contentType, content, messageId]
                    }
                    tx.executeSql(sql, values,
                        (statement, result) => {
                            resolve(result);
                        }, (statement, error) => {
                            reject(error);
                        }
                    );
                }, (statement, error) => {
                    reject(error)
                });
            });
        });
    }

    /**
     * 将消息列表存入数据库
     * @param {ChatListItem[]} chatlist;
     */
    saveChatList(chatlist) {
        if (this.#currDb == null) return null;
        this.#currDb.transaction(tx => {
            chatlist.forEach(chat => {
                this.#saveChatListItem(tx, chat);
            })
        })
    }

    saveChatListItem(item) {
        if (this.#currDb == null) return null;
        this.#currDb.transaction(tx => {
            this.#saveChatListItem(tx, item);
        });
    }

    saveTimelineId(timelineId) {
        if (this.#currDb == null) return null;
        this.#currDb.transaction(tx => {
            tx.executeSql("update tbl_config set latestTimelineId = ? where id = 1", [timelineId]);
        });
    }

    loadTimelineId() {
        return new Promise((reslove) => {
            if (this.#currDb == null) {
                reslove(0);
                return;
            }
            this.#currDb.transaction(tx => {
                tx.executeSql("select latestTimelineId from tbl_config where id = 1", null, (_, r) => {
                    if (r.rows.length > 0) {
                        const id = r.rows.item(0).latestTimelineId;
                        if (id == null) {
                            reslove(0);
                        } else {
                            reslove(id);
                        }
                    }
                }, (_, e) => {
                    reslove(0);
                })
            })
        })
    }

    /**
     * @param {SQLite.SQLTransaction} tx
     * @param {ChatListItem} chat 
     */
    #saveChatListItem(tx, chat) {
        tx.executeSql("select chatId from tbl_chatlist where chatId = ?", [chat.chatId], (_, r) => {
            let sql = "insert into tbl_chatlist values(?,?,?,?,?,?)";
            let value = [chat.chatId, chat.targetId, chat.type, chat.newMessageCount, chat.updateTime, chat.latestMessage];
            if (r.rows.length > 0) {
                sql = "update tbl_chatlist set targetId = ?, type = ?, newMessageCount = ?, updateTime = ?, latestMessage = ? where chatId = ?";
                value = [chat.targetId, chat.type, chat.newMessageCount, chat.updateTime, chat.latestMessage, chat.chatId];
            }
            tx.executeSql(sql, value, (_, r) => { console.log("chatlist saved", r), (_, e) => console.log("chatlist saved error:", e) })
        }, (_, e) => {
            console.log(`save chatlist[${chat.chatId}] error: ${e}`);
        });
    }

    /**
     * 读取对话列表
     * @returns {Promise<ChatListItem[]>}  
     */
    loadChatList() {
        return new Promise((resolve, reject) => {
            if (this.#currDb == null) reject(ERROR_DB_ISNULL);
            this.#currDb.transaction(tx => {
                tx.executeSql("select * from tbl_chatlist", null, (_, r) => {
                    let ret = [];
                    for (let i = 0; i < r.rows.length; i++) {
                        const item = r.rows.item(i);
                        const chatListItem = new ChatListItem(item.chatId);
                        chatListItem.init(item.targetId, item.type, item.newMessageCount, item.updateTime, item.latestMessage);
                        ret.push(chatListItem);
                    }
                    resolve(ret);
                }, (_, e) => {
                    console.error("load chatlist error:", e);
                    reject(e);
                })
            })
        })
    }

    loadMessage() {
        return new Promise((resolve, reject) => {
            if (this.#currDb == null) reject(ERROR_DB_ISNULL);
            this.#currDb.transaction(tx => {
                tx.executeSql("select * from tbl_message", null, (statement, r) => {
                    console.log(r);
                    resolve(r);
                }, (s, error) => {
                    reject(error);
                })
            })
        })
    }


}