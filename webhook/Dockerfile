FROM golang:1.17-alpine

LABEL maintainer="rzrbld <razblade@gmail.com>"

ENV GOPATH /go
ENV CGO_ENABLED 0
ENV GO111MODULE on
ENV GOPROXY https://proxy.golang.org

ADD src /src/

RUN  cd /src/ && go build main.go && cp main /go/bin/main

FROM alpine:3.15

EXPOSE 3333

COPY --from=0 /go/bin/main /usr/bin/main

RUN  \
     apk add --no-cache ca-certificates 'curl>7.61.0' 'su-exec>=0.2' && \
     echo 'hosts: files mdns4_minimal [NOTFOUND=return] dns mdns4' >> /etc/nsswitch.conf

CMD ["main"]