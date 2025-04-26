import pandas as pd
import mysql.connector

db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'qwerty',
    'database': 'sber'
}

csv_file_path = '../users.csv'
data = pd.read_csv(csv_file_path, sep=';')

data.columns = data.columns.str.strip()

connection = mysql.connector.connect(**db_config)
cursor = connection.cursor()

cursor.execute("DROP TABLE IF EXISTS my_table;")
create_table_query = """
CREATE TABLE my_table (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ФИО VARCHAR(255),
    Почта VARCHAR(255),
    Логин VARCHAR(255),
    Телефон VARCHAR(50)
);
"""
cursor.execute(create_table_query)

for index, row in data.iterrows():
    insert_query = """
    INSERT INTO my_table (ФИО, Почта, Логин, Телефон) VALUES (%s, %s, %s, %s);
    """
    print(f"Executing query: {insert_query} with values {row['ФИО']}, {row['Почта']}, {row['Логин']}, {row['Телефон']}")
    cursor.execute(insert_query, (row['ФИО'], row['Почта'], row['Логин'], row['Телефон']))

connection.commit()
cursor.close()
connection.close()

print("Данные успешно импортированы!")