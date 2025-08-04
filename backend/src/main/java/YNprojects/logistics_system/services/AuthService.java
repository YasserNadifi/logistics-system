package YNprojects.logistics_system.services;

import YNprojects.logistics_system.entities.AuthenticationResponse;
import YNprojects.logistics_system.entities.User;
import YNprojects.logistics_system.exceptions.UsernameAlreadyTakenException;
import YNprojects.logistics_system.repositories.UserRepo;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@AllArgsConstructor
public class AuthService {

    private final UserRepo userRepo;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    public AuthenticationResponse register(User request) {
        if (userRepo.existsByUsername(request.getUsername())){
            throw new UsernameAlreadyTakenException();
        }
        User newUser = new User();
        newUser.setUsername(request.getUsername());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
        newUser.setEmail(request.getEmail());
        newUser.setFullName(request.getFullName());
        newUser.setCreatedAt(LocalDateTime.now());
        newUser.setRole(request.getRole());
        try {
            newUser=userRepo.save(newUser);
        } catch (Exception e) {
            System.out.println("Error in saving user");
            System.out.println(e.getMessage());
            throw e;
        }
        String token = jwtService.generateToken(newUser);
        return new AuthenticationResponse(token);
    }

    public AuthenticationResponse login(User request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Wrong Username or Password");
        }
        User user = userRepo.findByUsername(request.getUsername()).orElseThrow();
        String token = jwtService.generateToken(user);
        return new AuthenticationResponse(token);
    }

}
