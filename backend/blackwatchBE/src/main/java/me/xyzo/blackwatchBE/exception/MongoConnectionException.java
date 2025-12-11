package me.xyzo.blackwatchBE.exception;

public class MongoConnectionException extends RuntimeException {
    private final String connectionString;
    private final ConnectionErrorType errorType;

    public MongoConnectionException(String message, String connectionString, ConnectionErrorType errorType) {
        super(message);
        this.connectionString = connectionString;
        this.errorType = errorType;
    }

    public MongoConnectionException(String message, ConnectionErrorType errorType) {
        this(message, null, errorType);
    }

    public String getConnectionString() { return connectionString; }
    public ConnectionErrorType getErrorType() { return errorType; }

    public enum ConnectionErrorType {
        INVALID_CREDENTIALS,
        CONNECTION_TIMEOUT,
        DATABASE_ACCESS_DENIED,
        INVALID_CONNECTION_STRING,
        NETWORK_ERROR
    }
}
