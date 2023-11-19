from mongoengine import (
    Document,
    EmbeddedDocumentListField,
    EmbeddedDocument,
    FloatField,
    IntField,
    ListField,
    StringField,
)


class Data(EmbeddedDocument):
    timestamps = ListField(FloatField)
    data = ListField(ListField(FloatField))
    channels = ListField(IntField)
    device_used = StringField(choices=["muse2"])


class User(Document):
    data = EmbeddedDocumentListField(Data)
