package YNprojects.logistics_system.controllers;

import YNprojects.logistics_system.DTO.ChangePasswordDto;
import YNprojects.logistics_system.DTO.UserDto;
import YNprojects.logistics_system.entities.AuthenticationResponse;
import YNprojects.logistics_system.entities.Shipment;
import YNprojects.logistics_system.entities.User;
import YNprojects.logistics_system.services.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/user")
public class UserController {

    private final UserService userService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping("/byjwt")
    public ResponseEntity<UserDto> getUserByJwt(@RequestBody AuthenticationResponse authenticationResponse) {
        System.out.println("in user controller , token : "+authenticationResponse.getToken());
        return ResponseEntity.ok(userService.getUserByJwt(authenticationResponse));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/changepassword")
    public ResponseEntity changePassword(@RequestBody ChangePasswordDto changePasswordDto) {
        userService.changePassword(changePasswordDto);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping
    public ResponseEntity<UserDto> updateUser(@RequestBody UserDto userDto) {
        return ResponseEntity.ok(userService.updateUser(userDto));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

}
