package YNprojects.logistics_system.exceptionhandler;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@AllArgsConstructor
@Getter
@Setter
public class ErrorResponse {
    private String message;
    private Instant timestamp;
}
