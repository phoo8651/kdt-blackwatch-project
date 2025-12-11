package me.xyzo.blackwatchBE.exception;

import me.xyzo.blackwatchBE.dto.MessageResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<MessageResponseDto> handleBadRequest(BadRequestException e) {
        return ResponseEntity.badRequest()
                .body(new MessageResponseDto(e.getMessage()));
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<MessageResponseDto> handleConflict(ConflictException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new MessageResponseDto(e.getMessage()));
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<MessageResponseDto> handleNotFound(NotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponseDto(e.getMessage()));
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<MessageResponseDto> handleUnauthorized(UnauthorizedException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new MessageResponseDto(e.getMessage()));
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<MessageResponseDto> handleForbidden(ForbiddenException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new MessageResponseDto(e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<MessageResponseDto> handleGeneral(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDto("내부 서버 오류가 발생했습니다."));
    }

    @ExceptionHandler(MongoSessionException.class)
    public ResponseEntity<Map<String, Object>> handleMongoSession(MongoSessionException e) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", e.getMessage());
        response.put("sessionId", e.getSessionId());
        response.put("errorType", e.getErrorType().name());

        HttpStatus status = switch (e.getErrorType()) {
            case SESSION_EXPIRED, SESSION_NOT_FOUND -> HttpStatus.NOT_FOUND;
            case SESSION_LIMIT_EXCEEDED -> HttpStatus.TOO_MANY_REQUESTS;
            case INVALID_SESSION_CREDENTIALS -> HttpStatus.UNAUTHORIZED;
            case SESSION_CREATION_FAILED, SESSION_EXTENSION_FAILED -> HttpStatus.INTERNAL_SERVER_ERROR;
        };

        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(MongoConnectionException.class)
    public ResponseEntity<Map<String, Object>> handleMongoConnection(MongoConnectionException e) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", e.getMessage());
        response.put("errorType", e.getErrorType().name());

        HttpStatus status = switch (e.getErrorType()) {
            case INVALID_CREDENTIALS, DATABASE_ACCESS_DENIED -> HttpStatus.UNAUTHORIZED;
            case CONNECTION_TIMEOUT, NETWORK_ERROR -> HttpStatus.REQUEST_TIMEOUT;
            case INVALID_CONNECTION_STRING -> HttpStatus.BAD_REQUEST;
        };

        return ResponseEntity.status(status).body(response);
    }
}