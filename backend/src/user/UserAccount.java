

public class UserAccount {
    private int id;
    private String name;
    private List<Ingredient> allergies;
    private bool darkMode;
    private int missingIngredientThreshold;

    public UserAccount(String name, List<Ingredient> allergies, bool darkMode) {
        this.name = name;
        this.allergies = allergies;
        this.darkMode = darkMode;
        // + more
    }

    public void signIn() {

    }

    public void notifyUser(String message) {

    }
}