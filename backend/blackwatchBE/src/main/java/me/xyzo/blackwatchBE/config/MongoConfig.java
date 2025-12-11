package me.xyzo.blackwatchBE.config;

import com.mongodb.ConnectionString;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;

@Configuration
public class MongoConfig extends AbstractMongoClientConfiguration {

    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;

    @Override
    protected String getDatabaseName() {
        return "db_challenges";  // blackwatch_data -> db_challenges로 변경
    }

    @Override
    public MongoClient mongoClient() {
        return MongoClients.create(new ConnectionString(mongoUri));
    }

    @Override
    protected boolean autoIndexCreation() {
        return true;
    }
}