package YNprojects.logistics_system.repositories;

import YNprojects.logistics_system.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepo extends JpaRepository<User, Long> {

    Boolean existsByUsername(String username);
    Optional<User> findByUsername(String username);

}
