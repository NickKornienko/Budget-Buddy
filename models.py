"""
This file defines the database models
"""

import datetime
from .common import db, Field, auth
from pydal.validators import *


def get_user_email():
    return auth.current_user.get('email') if auth.current_user else None


def get_time():
    return datetime.datetime.utcnow()


db.define_table(
    'budgets',
    Field('budget_name', requires=IS_NOT_EMPTY()),

    Field('work', 'float', default=0,
          requires=IS_FLOAT_IN_RANGE(0, 1e6)),

    Field('investments', 'float', default=0,
          requires=IS_FLOAT_IN_RANGE(0, 1e6)),

    Field('other_income', 'float', default=0,
          requires=IS_FLOAT_IN_RANGE(0, 1e6)),
    Field('rent', 'float', default=0,

          requires=IS_FLOAT_IN_RANGE(0, 1e6)),
    Field('hobbies', 'float', default=0,
          requires=IS_FLOAT_IN_RANGE(0, 1e6)),

    Field('other_expenses', 'float', default=0,
          requires=IS_FLOAT_IN_RANGE(0, 1e6)),

    Field('user_id', default=get_user_email),

    Field('creation_date', 'datetime', default=get_time),
)

db.budgets.id.readable = db.budgets.id.writable = False
db.budgets.user_id.readable = db.budgets.user_id.writable = False
db.budgets.creation_date.readable = db.budgets.creation_date.writable = False


db.commit()
