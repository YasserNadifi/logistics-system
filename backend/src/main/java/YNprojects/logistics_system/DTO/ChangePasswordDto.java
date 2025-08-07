package YNprojects.logistics_system.DTO;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ChangePasswordDto {

    private String username;
    private String newPassword;

}
