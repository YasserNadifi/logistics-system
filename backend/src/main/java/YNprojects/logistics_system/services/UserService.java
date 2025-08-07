package YNprojects.logistics_system.services;

import YNprojects.logistics_system.DTO.ChangePasswordDto;
import YNprojects.logistics_system.DTO.UserDto;
import YNprojects.logistics_system.entities.AuthenticationResponse;
import YNprojects.logistics_system.entities.User;
import YNprojects.logistics_system.mapper.UserMapper;
import YNprojects.logistics_system.repositories.UserRepo;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class UserService {

    private final UserRepo userRepo;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public List<UserDto> getAllUsers() {
        return userRepo.findAll()
                .stream()
                .map(UserMapper::toDto)
                .collect(Collectors.toList());
    }

    // Get user by ID
    public UserDto getUserById(Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return UserMapper.toDto(user);
    }

    public UserDto getUserByJwt(AuthenticationResponse authenticationResponse) {
        String username=jwtService.extractUsername(authenticationResponse.getToken());
        User user = userRepo.findByUsername(username).orElseThrow();
        return UserMapper.toDto(user);
    }

    public void changePassword(ChangePasswordDto changePasswordDto) {
        User user = userRepo.findByUsername(changePasswordDto.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found with username: " + changePasswordDto.getUsername()));;
        user.setPassword(passwordEncoder.encode(changePasswordDto.getNewPassword()));
        userRepo.save(user);

    }

}
