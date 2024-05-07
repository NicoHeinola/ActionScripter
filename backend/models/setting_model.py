from models.base_model import BaseModel
from database.database import db


class Setting(BaseModel):

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(9999), unique=False, nullable=False)
    value = db.Column(db.String(9999), unique=False, nullable=False)

    @property
    def serialize(self):
        return {
            'id': self.id,
            'name': self.key,
            'value': self.value,
        }
