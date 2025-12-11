package me.xyzo.blackwatchBE.exception;

public class MongoSessionException extends RuntimeException {
    private final String sessionId;
    private final SessionErrorType errorType;

    public MongoSessionException(String message, String sessionId, SessionErrorType errorType) {
        super(message);
        this.sessionId = sessionId;
        this.errorType = errorType;
    }

    public MongoSessionException(String message, SessionErrorType errorType) {
        this(message, null, errorType);
    }

    public String getSessionId() { return sessionId; }
    public SessionErrorType getErrorType() { return errorType; }

    public enum SessionErrorType {
        SESSION_EXPIRED,
        SESSION_NOT_FOUND,
        SESSION_LIMIT_EXCEEDED,
        INVALID_SESSION_CREDENTIALS,
        SESSION_CREATION_FAILED,
        SESSION_EXTENSION_FAILED
    }
}

