FROM node:16 as frontend

WORKDIR /app
COPY package.json .
RUN npm install --force

COPY config config
COPY src src
COPY index.html index.html
RUN npm run build


FROM node:16 as server

WORKDIR /app

# Install Apprise, add sqlite3 cli for debugging in the future, iputils-ping for ping, util-linux for setpriv
# Stupid python3 and python3-pip actually install a lot of useless things into Debian, specify --no-install-recommends to skip them, make the base even smaller than alpine!
RUN apt update && \
    apt --yes --no-install-recommends install python3 python3-pip python3-cryptography python3-six python3-yaml python3-click python3-markdown python3-requests python3-requests-oauthlib \
    sqlite3 iputils-ping util-linux dumb-init chromium && \
    pip3 --no-cache-dir install apprise==0.9.6 && \
    rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1

COPY package.json .
COPY package-lock.json .
RUN npm install --production --force


COPY --from=frontend /app/dist dist
COPY . .
RUN chmod +x /app/extra/entrypoint.sh

EXPOSE 3001
VOLUME ["/app/data"]
ENTRYPOINT ["/usr/bin/dumb-init", "--", "extra/entrypoint.sh"]
CMD ["node", "server/server.js"]
