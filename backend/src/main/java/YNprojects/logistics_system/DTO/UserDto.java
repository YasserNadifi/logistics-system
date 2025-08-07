package YNprojects.logistics_system.DTO;

import YNprojects.logistics_system.entities.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private Role role;
    private LocalDateTime createdAt;
}
