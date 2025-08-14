package YNprojects.logistics_system.user.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ChangePasswordDto {

    private String username;
    private String newPassword;

}
