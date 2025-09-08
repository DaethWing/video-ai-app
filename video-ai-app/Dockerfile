FROM node:18

# Install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Build frontend
RUN cd frontend && npm install && npm run build

EXPOSE 10000
CMD ["npm", "start"]
