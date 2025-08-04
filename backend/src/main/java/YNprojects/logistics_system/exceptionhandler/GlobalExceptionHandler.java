package YNprojects.logistics_system.exceptionhandler;

import YNprojects.logistics_system.entities.ErrorResponse;
import YNprojects.logistics_system.exceptions.ResourceNotFoundException;
import YNprojects.logistics_system.exceptions.UsernameAlreadyTakenException;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UsernameAlreadyTakenException.class)
    public ResponseEntity<ErrorResponse> handleUsernameAlreadyTaken(RuntimeException e) {
        ErrorResponse errorResponse = new ErrorResponse(
                e.getMessage(),
                Instant.now()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException e) {
        ErrorResponse error = new ErrorResponse(
                e.getMessage(),
                Instant.now()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentialsException(BadCredentialsException e) {
        ErrorResponse error = new ErrorResponse(
                e.getMessage(),
                Instant.now()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

}
