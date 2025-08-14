package YNprojects.logistics_system.user.service;

import YNprojects.logistics_system.user.dto.ChangePasswordDto;
import YNprojects.logistics_system.user.dto.UserDto;
import YNprojects.logistics_system.user.entity.AuthenticationResponse;
import YNprojects.logistics_system.user.entity.User;
import YNprojects.logistics_system.user.mapper.UserMapper;
import YNprojects.logistics_system.user.repository.UserRepo;
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

    public UserDto updateUser(UserDto userDto) {
        User user = userRepo.findByUsername(userDto.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found with username: " + userDto.getUsername()));
        user.setFullName(userDto.getFullName());
        user.setEmail(userDto.getEmail());
        user.setRole(userDto.getRole());
        userRepo.save(user);
        return UserMapper.toDto(user);
    }

    public void deleteUser(Long id) {
        userRepo.deleteById(id);
    }

    public void changePassword(ChangePasswordDto changePasswordDto) {
        User user = userRepo.findByUsername(changePasswordDto.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found with username: " + changePasswordDto.getUsername()));;
        user.setPassword(passwordEncoder.encode(changePasswordDto.getNewPassword()));
        userRepo.save(user);

    }

}
