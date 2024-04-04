# About
This is a tool to automate mouse and keyboard events such as clicks, movement or keypresses.

## Technologies
- React and electron for frontend
- Python and python-flask for backend

It is afterwards compiled into a "single" executable that launches two applications (frontend and backend) that work as a "single application".

# .Env files
## tools/frontpacker
.env should have:
- BUILD_MODE
    - debug: Means that we are running the app in localhost:3000
    - other: Means that we want to use the pre-built app files

## frontend
.env should have:
- API_URL
    - Address of the python backend (normally 127.0.0.1)
- API_PORT
    - What port the python backend runs in