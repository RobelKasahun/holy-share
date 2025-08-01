from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy 
from flask_migrate import Migrate
from datetime import timedelta
from flask_cors import CORS
from config import Config
from flask import Flask
import os

'''
    sets up the connection to your database 
    and prepares you to create models.
'''
db = SQLAlchemy()
    
'''
    enables database migrations, so when you change models, 
    you can update the database schema smoothly.
'''
migrate = Migrate()

def create_app():
    # initialize Flask app
    app = Flask(__name__)

    # load the configuration settings from the Config class
    '''
        load database uri, secret key, and track object modification
    '''
    app.config.from_object(Config)
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=1)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
    app.config['JWT_TOKEN_LOCATION'] = ['cookies']
    app.config['JWT_COOKIE_CSRF_PROTECT'] = False  # For development
    app.config['JWT_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
    
    jwt = JWTManager(app)
    
    # initialize db
    db.init_app(app)
    # initialize migration
    migrate.init_app(app, db)

    '''
        it allows backend to accept requests from your frontend, 
        even if they are on different domains/ports
        
        Allows your frontend (maybe running on localhost:3000) 
        to talk to this Flask backend (usually on localhost:5000).
    '''
    # allows the front end to talk to the backend
    CORS(app, supports_credentials=True, origins=["http://localhost:5173"])
    
    with app.app_context():
        from app.models import User, Post, Comment, Like
        # Register the blueprint with the app
        from app.routes.auth_route import auth_blueprint
        from app.routes.profile_route import profile_blueprint
        from app.routes.post_route import post_blueprint
        from app.routes.comment_route import comment_blue_print
        from app.routes.like_route import like_blueprint
        from app.routes.user_route import user_blueprint
        from app.routes.follow_route import follow_blueprint
        
        app.register_blueprint(auth_blueprint, url_prefix='/auth')
        app.register_blueprint(profile_blueprint, url_prefix='/profile')
        app.register_blueprint(post_blueprint, url_prefix='/posts')
        app.register_blueprint(comment_blue_print, url_prefix='/comments')
        app.register_blueprint(like_blueprint, url_prefix='/likes')
        app.register_blueprint(user_blueprint, url_prefix='/users')
        app.register_blueprint(follow_blueprint, url_prefix='/followers')
    
    return app