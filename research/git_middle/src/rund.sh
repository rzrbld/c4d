export OAUTH_ENABLE=true && \
export LOG_LEVEL=DEBUG && \
export HOST_PORT=localhost:8099 &&\
export AUDIT_LOG_ENABLE=true &&\
# export GIT_TOKEN=f075e8466183e9da6d1a44c964effdda8fb69e003665f43b1e23d3caed0143a5 &&\
export GIT_TOKEN=d53a1fb0425ca7d1944ca0d82a1934582c5a496c590d67006c4f493b88b7f814 &&\
export OAUTH_PROVIDER=gitlab &&\
export OAUTH_CLIENT_ID=2cb3ca8382eca95585514017b68a13bf4e671efc84d9b00854efc15d079b8090 &&\
export OAUTH_CLIENT_SECRET=61312edd8db594fce5ae8be5ca3896be2a3522d4bd11388ff47f3d5d358c3cff &&\
export OAUTH_CALLBACK=http://localhost:8099/auth/callback &&\
export OAUTH_CUSTOM_DOMAIN=gitlab.rzrbld.ru &&\
echo "starting...." && ./main 