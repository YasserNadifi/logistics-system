package YNprojects.logistics_system.controllers;

import YNprojects.logistics_system.entities.AuthenticationResponse;
import YNprojects.logistics_system.entities.User;
import YNprojects.logistics_system.services.AuthService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody User user) {
        return ResponseEntity.ok(authService.register(user));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@RequestBody User user) {
        return ResponseEntity.ok(authService.login(user));
    }

    @PostMapping("/verifyJwt")
    public ResponseEntity<AuthenticationResponse> verifyJwt(@RequestBody AuthenticationResponse jwtObject) {
        String token = jwtObject.getToken();
        String message;
        if(authService.verifyJwt(token)){
            message = "valid";
        } else {
            message = "invalid";
        }
        System.out.println(message);
        return ResponseEntity.ok(new AuthenticationResponse(message));
    }

}
