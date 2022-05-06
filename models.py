"""
This file defines the database models
"""

from cmath import inf
import datetime
from email.policy import default
from .common import db, Field, auth
from pydal.validators import *


def get_user_email():
    return auth.current_user.get('email') if auth.current_user else None


def get_time():
    return datetime.datetime.utcnow()


db.define_table(
    'budgets',
    Field('name', requires=IS_NOT_EMPTY()),
    Field('user_id', default=get_user_email),
    Field('expenses', 'integer', default=0),
    Field('income', 'integer', default=0),
    Field('net_flow', 'integer', default=0),
    Field('creation_date', 'datetime', default=get_time),
)

db.budgets.id.readable = db.budgets.id.writable = False
db.budgets.user_id.readable = db.budgets.user_id.writable = False
db.budgets.creation_date.readable = db.budgets.creation_date.writable = False

db.define_table(
    'budget_items',
    Field('budget_id', requires=IS_NOT_EMPTY()),
    Field('name', requires=IS_NOT_EMPTY()),
    Field('type', requires=IS_IN_SET(['Expense', 'Income'])),
    Field('amount', 'integer', requires=IS_INT_IN_RANGE(0, 1e6)),
    Field('creation_date', 'datetime', default=get_time),
)

db.budget_items.id.readable = db.budget_items.id.writable = False
db.budget_items.budget_id.readable = db.budget_items.budget_id.writable = False
db.budget_items.creation_date.readable = db.budget_items.creation_date.writable = False

db.commit()
