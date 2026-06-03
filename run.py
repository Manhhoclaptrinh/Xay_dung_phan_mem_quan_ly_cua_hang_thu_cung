from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000, use_reloader=True, reloader_type='stat',
            extra_files=[], exclude_patterns=['*.pyc', 'site-packages/*'])