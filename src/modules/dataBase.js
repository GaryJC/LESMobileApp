import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";

/**
 * 
 * @deprecated 数据库方法都转移到DatabaseService中了，这里的弃用
 */
function openDatabase() {
  if (Platform.OS === "web") {
    console.log("SQLite is not supported on web");
    return;
  }

  const db = SQLite.openDatabase("db.db");

  return db;
}

export const db = openDatabase();

/**
 * 
 * @deprecated 数据库方法都转移到DatabaseService中了，这里的弃用
 */
export const createTable = () => {
  db.transaction((tx) => {
    // creata a table that stores messages
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS messages (
        messageId INTEGER PRIMARY KEY NOT NULL,
        timelineId INTEGER NOT NULL,
        senderId INTEGER NOT NULL,
        recipientId INTEGER NOT NULL,
        messageType INTEGER NOT NULL,
        groupId INTEGER,
        timestamp INTEGER NOT NULL,
        contentType INTEGER NOT NULL,
        content TEXT NOT NULL
      );`
    );
  });
};
