from app.database import SessionLocal
from app.models import Task, Board
from app.models.user import User

db = SessionLocal()



try:
    users = db.query(User).all()

    if users:
        for user in users:
            print("user:", user.id, user.email, user.username, user.role)

    else:
        print("NONE")

    tasks = db.query(Task).all()

    if tasks:
        for task in tasks:
            print("tasks:", task.id, task.description, task.title, task.status, task.board_id)

    else:
        print("NONE")

    boards = db.query(Board).all()

    if boards:
        for board in boards:
            print("board:", board.id, board.description, board.title, board.created_by)

    else:
        print("NONE")

    print("///////////////////////////////////////////////////////////")

    tasks = db.query(Task).filter(Task.board_id == 1).all()

    if tasks:
        for task in tasks:
            print("tasks:", task.id, task.description, task.title, task.status, task.board_id)

    else:
        print("NONE")

    print("///////////////////////////////////////////////////////////")

    board = db.query(Board).filter_by(created_by=1).first()
    print(board.created_by)

    if boards:
        for board in boards:
            print("board:", board.id, board.description, board.title)

    else:
        print("NONE")

    user = db.query(User).filter_by(email='user10@example.com').first()
    print(user.username)
except Exception as e:
    print("ERROR: ", e)

finally:
    db.close()