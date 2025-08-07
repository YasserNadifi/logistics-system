package YNprojects.logistics_system.mapper;

import YNprojects.logistics_system.DTO.UserDto;
import YNprojects.logistics_system.entities.User;

public class UserMapper {
    public static UserDto toDto(User user) {
        if (user == null) return null;

        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setRole(user.getRole());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
