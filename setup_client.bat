@echo off
cd client
call npm install
call npm install -D tailwindcss postcss autoprefixer
call npx tailwindcss init -p
call npm install react-router-dom three @react-three/fiber @react-three/drei
call npm install -D @types/three
