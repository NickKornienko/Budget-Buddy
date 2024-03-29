"""
This file defines actions, i.e. functions the URLs are mapped into
The @action(path) decorator exposed the function at URL:
    http://127.0.0.1:8000/{app_name}/{path}
If app_name == '_default' then simply
    http://127.0.0.1:8000/{path}
If path == 'index' it can be omitted:
    http://127.0.0.1:8000/
The path follows the bottlepy syntax.
@action.uses('generic.html')  indicates that the action uses the generic.html template
@action.uses(session)         indicates that the action uses the session
@action.uses(db)              indicates that the action uses the db
@action.uses(T)               indicates that the action uses the i18n & pluralization
@action.uses(auth.user)       indicates that the action requires a logged in user
@action.uses(auth)            indicates that the action requires the auth object
session, db, T, auth, and tempates are examples of Fixtures.
Warning: Fixtures MUST be declared with @action.uses({fixtures}) else your app will result in undefined behavior
"""

from py4web import action, request, abort, redirect, URL, Field
from yatl.helpers import A
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from py4web.utils.url_signer import URLSigner
from .models import get_user_email
from py4web.utils.form import Form, FormStyleBulma, FormStyleDefault, RadioWidget
from pydal.validators import *
import uuid
import random

url_signer = URLSigner(session)


@action('index')
@action.uses('display.html', db, auth.user, url_signer)
def index():
    rows = db(db.budgets.user_id == get_user_email()).select()
    return dict(
        my_callback_url=URL('my_callback', signer=url_signer),
        search_url = URL('search', signer=url_signer),
        get_budget_url=URL('get_budget_url', signer=url_signer),
        rows=rows,
        url_signer=url_signer
    )


@action('graph/<budget_id:int>')
@action.uses('graph_display.html', db, auth.user, url_signer)
def index(budget_id=None):
    assert budget_id is not None
    budget_name = db(db.budgets.id == budget_id).select()[0].name
    rows = db(db.budgets.user_id == get_user_email()).select()
    budget_items=db(db.budget_items.budget_id==budget_id).select().as_list()

    return dict(
        my_callback_url=URL('my_callback', signer=url_signer),
        rows=rows,
        url_signer=url_signer,
        budget_name=budget_name,
        budget_id=budget_id,
        budget_items=budget_items,
        get_budgets_url=URL('get_budgets', signer=url_signer),
        get_budget_items_url= URL('get_budget_items', signer=url_signer),
        
    )



@action('get_budgets')
@action.uses(url_signer.verify(), db)
def get_images():
    """Returns the list of images."""
    budgets = db(db.budgets).select().as_list()
    return dict(budgets=budgets)


@action('get_budget_items', method="POST")
@action.uses(url_signer.verify(), db)
def get_budget_items():
    budget_id = request.json.get('budget_id')

    budget_items=db(db.budget_items.budget_id==budget_id).select().as_list()
    budget_name=db(db.budgets.id == budget_id).select()[0].name
    return dict(budget_items=budget_items, budget_name=budget_name)




@action('display')
@action.uses('display.html', db, auth.user, url_signer)
def display():
    return dict(
        my_callback_url=URL('my_callback', signer=url_signer),
        search_url=URL('search', signer=url_signer),
        get_budget_url=URL('get_budget_url', signer=url_signer),
        rows=db(db.budgets.user_id == get_user_email()).select(),
        url_signer=url_signer
    )


@action('create', method=["GET", "POST"])
@action.uses('create.html', db, auth.user, url_signer.verify())
def create():
    form = Form([Field('name')], csrf_session=session,
                formstyle=FormStyleBulma)
    if form.accepted:
        db.budgets.insert(name=form.vars['name'])
        redirect(URL('display'))

    return dict(
        my_callback_url=URL('my_callback', signer=url_signer),
        form=form,
        url_signer=url_signer
    )


@action('edit_budget/<budget_id:int>', method=["GET", "POST"])
@action.uses('edit_budget.html', db, auth.user, url_signer, url_signer.verify())
def edit_budget(budget_id=None):
    assert budget_id is not None

    budget_name = db(db.budgets.id == budget_id).select()[0].name
    rows = db(db.budget_items.budget_id == budget_id).select()
    budget_items = db(db.budgets.id == budget_id).select().as_list()[0]

    return dict(
        my_callback_url=URL('my_callback', signer=url_signer),
        rows=rows,
        budget_name=budget_name,
        budget_id=budget_id,
        url_signer=url_signer,
        total=budget_items['net_flow'],
        expenses=budget_items['expenses'],
        income=budget_items['income']
    )


@action('delete_budget/<budget_id:int>')
@action.uses(db, auth.user, session, url_signer.verify())
def delete_budget(budget_id=None):
    assert budget_id is not None
    db(db.budgets.id == budget_id).delete()
    redirect(URL('display'))


@action('add_budget_item/<budget_id:int>', method=["GET", "POST"])
@action.uses('add_budget_item.html', db, auth.user, url_signer, url_signer.verify())
def add_budget_item(budget_id=None):
    assert budget_id is not None
    # FormStyleDefault.widgets['type']=RadioWidget() # type should be a radio button rather than text boz
    form = Form([Field('name'), Field('amount'), Field('type', requires=IS_IN_SET(['Expense', 'Income']))], csrf_session=session,
                formstyle=FormStyleBulma)
    if form.accepted:
        db.budget_items.insert(
            budget_id=budget_id,
            name=form.vars['name'],
            amount=form.vars['amount'],
            type=form.vars['type']
        )

        update_budget(budget_id)

        redirect(URL(f'edit_budget/{budget_id}', signer=url_signer))
    return dict(
        my_callback_url=URL('my_callback', signer=url_signer),
        budget_id=budget_id,
        form=form,
        url_signer=url_signer
    )


@action('edit_budget_item/<budget_id:int>/<budget_items_id:int>', method=["GET", "POST"])
@action.uses('edit_budget_item.html', db, session, auth.user, url_signer, url_signer.verify())
def edit_budget_item(budget_items_id=None, budget_id=None):
    assert budget_items_id is not None
    # We read the bird being edited from the db.
    # p = db(db.bird.id == bird_name).select().first()
    p = db(db.budget_items.id == budget_items_id).select().first()
    if p is None:
        # Nothing found to be edited!
        redirect(URL('edit_budget', budget_id, signer=url_signer))
    # Edit form: it has record=
    form = Form(db.budget_items, record=p, deletable=False,
                csrf_session=session, formstyle=FormStyleBulma)
    if form.accepted:
        # The update already happened!
        update_budget(budget_id)
        redirect(URL('edit_budget', budget_id, signer=url_signer))
    return dict(
        form=form,
        url_signer=url_signer,
        budget_id=budget_id,
        my_callback_url=URL('my_callback', signer=url_signer)
    )


def update_budget(budget_id):
    budget_items = db(db.budget_items.budget_id ==
                      budget_id).select().as_list()

    expenses = 0
    income = 0
    for budget_item in budget_items:
        if budget_item['type'] == 'Expense':
            expenses += budget_item['amount']
        else:
            income += budget_item['amount']

    net_flow = income - expenses

    db(db.budgets.id == budget_id).update(
        expenses=expenses, income=income, net_flow=net_flow)


@action('delete_budget_item/<budget_id:int>/<budget_item_id:int>')
@action.uses(db, auth.user, session, url_signer.verify())
def delete_budget(budget_id=None, budget_item_id=None):
    assert budget_id is not None
    assert budget_item_id is not None
    db(db.budget_items.id == budget_item_id).delete()
    redirect(URL(f'edit_budget/{budget_id}', signer=url_signer))


@action('search')
@action.uses(db,session,url_signer)
def search():
    q = request.params.get('q')
    budgets = db(db.budgets.name).select().as_list()
    searchList = []
    names = []
    for budget in budgets:
        if budget["name"] not in names:
            searchList.append(budget)
            names.append(budget["name"])
    # results = [q + ":" + str(uuid.uuid1()) for _ in range(random.randint(2, 6))]
    results = []
    for item in searchList:
        if q.upper() in item["name"].upper():
            results.append(item["name"])
    return dict(results=results, signer=url_signer)





@action('get_budget_url')
@action.uses(db, url_signer,url_signer.verify())
def get_budget_url():
    budget_name = request.params.get('budget_id')
    for row in db(db.budgets).select():
        if row.name == budget_name:
            budget_id = row.id

    return dict(url=URL(f'edit_budget/{budget_id}', signer=url_signer))

