

public class Ingredient {
    private int id;
    private String name;
    private String image;
    private Date expiry;


    public Ingredient(String name, String image, Date expiryDate) {
        this.name = name;
        this.image = image;
        this.expiry = expiryDate;
        // error handling, generate random id (or pass in?), etc
    }

    public void selectIngredientToDelete(int userID) {

    }

    public void selectIngredient(Ingredient ing, int userID) {

    }

    void editExpiryDate() {

    }
}
