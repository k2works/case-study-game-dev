
import pandas as pd


class CSVRepository:
    def __init__(self, file) -> None:
        self.file = file

    def get_data(self):
        return pd.read_csv(self.file)


class SQLRepository:
    def __init__(self, table) -> None:
        self.table = table

    def get_data(self):
        from sqlalchemy import create_engine
        host = 'localhost'
        port = '5432'
        db = 'test'
        username = 'root'
        password = 'root'

        engine = create_engine(
            f'postgresql://{username}:{password}@{host}:{port}/{db}')
        return pd.read_sql_table(self.table, engine)
