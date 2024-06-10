# About
This is a tool to automate mouse and keyboard events such as clicks, movement or keypresses.

## Technologies
- React and Electron for frontend
- Python and Flask for backend

It is afterwards compiled into a "single" executable that launches two applications (frontend and backend) that work as a "single application".

# How to make a release
## Automatic
Run build.bat (Windows only)

# .Env files
## backend
.env should have:
- HOST
    - What host the backend runs in. It should most likely be 127.0.0.1.
- PORT
    - What port the backend runs in. Should match the frontend configuration.
- PROTOCOL
    - Typically http. Only used for release build in frontpacker.
- BUILD_MODE
    - DEBUG / RELEASE

## frontend
.env should have:
- REACT_APP_API_URL
    - Address of the python backend (normally http://127.0.0.1).
- REACT_APP_API_PORT
    - What port the python backend runs in.