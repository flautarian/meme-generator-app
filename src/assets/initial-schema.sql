CREATE TABLE IF NOT EXISTS Templates (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        img VARCHAR(255),
        name VARCHAR(255)
      );


CREATE TABLE IF NOT EXISTS Inputs (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        templateId INTEGER,
        xAxis INTEGER,
        yAxis INTEGER,
        value VARCHAR(255),
        FOREIGN KEY (templateId) REFERENCES templates(ID) ON DELETE CASCADE
      );
