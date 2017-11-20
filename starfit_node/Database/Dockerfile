FROM mongo

WORKDIR /var/dmongo
COPY ./data /var/dmongo

CMD mongoimport --host database -d db -c service --drop --type json --file /var/dmongo/services.json --jsonArray && \
	 	mongoimport --host database -d db -c user --drop --type json --file /var/dmongo/users.json --jsonArray && \
		mongoimport --host database -d db -c image --drop --type json --file /var/dmongo/images.json --jsonArray
