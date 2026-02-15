namespace JioMartScraping
{
    public class ProductsDetails
    { 
        public string? ProductName {  get; set; }
        public string? ProductPrice {  get; set; }
        public string? EMIStart {  get; set; }
        public string? EMIOffer {  get; set; }
        public string? PinCode {  get; set; }
        public string? Address {  get; set; }
        public string? Feature {  get; set; }
        public string? Specification {  get; set; }
        public string? ImageLinks {  get; set; }

        public ProductsDetails()
        {
            ProductName = null; ProductPrice = null; EMIStart = null; EMIOffer = null; PinCode = null; Address = null; Feature = null; Specification = null; ImageLinks = null;
        }
    }
}
