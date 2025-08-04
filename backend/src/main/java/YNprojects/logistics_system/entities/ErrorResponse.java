package YNprojects.logistics_system.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
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
