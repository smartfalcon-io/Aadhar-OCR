FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY tsconfig.json .
COPY . .
EXPOSE 8050
RUN npm run build

FROM node:18-alpine
# Copy production dependencies from build stage
COPY --from=build /app/node_modules ./node_modules
# Copy compiled JavaScript files and other necessary files (package.json, etc.)
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
CMD ["npm","run","prod"]
