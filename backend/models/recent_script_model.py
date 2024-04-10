from models.base_model import BaseModel
from database.database import db


class RecentScript(BaseModel):

    id = db.Column(db.Integer, primary_key=True)
    path = db.Column(db.String(1000), unique=False, nullable=False)

    @property
    def serialize(self):
        return {
            'id': self.id,
            'path': self.path,
        }
