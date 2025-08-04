package YNprojects.logistics_system.exceptions;

public class UsernameAlreadyTakenException extends RuntimeException {

    public UsernameAlreadyTakenException() {
        super("Username already taken");
    }

}
