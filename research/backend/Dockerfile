FROM openjdk:17

LABEL maintainer="rzrbld <razblade@gmail.com>"

ADD ./out/artifacts/c4ke_backend_jar/backend.jar /app/
WORKDIR /app
ENTRYPOINT ["java","-jar","backend.jar"]
