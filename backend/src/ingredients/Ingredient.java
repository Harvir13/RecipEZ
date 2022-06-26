

public class Ingredient {
    private int id;
    private String name;
    private String image;
    private Date expiry;

    /**
     * Constructor for Ingredient. Needs to take in image/id?
     */
    public Ingredient(String name, String image, Date expiryDate) {
        this.name = name;
        this.image = image;
        this.expiry = expiryDate;
        // error handling, generate random id, etc
    }
}