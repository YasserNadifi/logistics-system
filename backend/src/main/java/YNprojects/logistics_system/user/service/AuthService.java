package YNprojects.logistics_system.user.service;

import YNprojects.logistics_system.user.entity.AuthenticationResponse;
import YNprojects.logistics_system.user.entity.User;
import YNprojects.logistics_system.exceptions.UsernameAlreadyTakenException;
import YNprojects.logistics_system.user.repository.UserRepo;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
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

    public boolean verifyJwt(String jwt) {
        try {
            System.out.println("jwt : "+jwt);
            // i used extractUsername instead of using isValid beacause the latter would require extracting
            //  the username and then validating the jwt against the user with that username which achieves
            // nothing, since the actual verification and exception throwing happens inside extractUsername
            jwtService.extractUsername(jwt);
            return true;
        } catch (Exception e) {
            System.out.println("verifyJwt exception : " + e.getMessage());
            System.out.println("verifyJwt exception name : " + e.getClass().getName());
            return false;
        }
    }

}
