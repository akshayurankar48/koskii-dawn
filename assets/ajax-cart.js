class AjaxCart extends HTMLElement {
    constructor() {
      super();
  
      this.initComponent();
      this.initEvents();
    }
  
    // Custom Components loops through the list and creates the custom elements
    initComponent() {
      this.getCustomComponentToInit().map((component) => {
        if(!window.customElements.get(component.customElement)){
          window.customElements.define(component.customElement, component.className);
        }
      });
    }
  
    // Custom Components list
    getCustomComponentToInit() {
      return [
        {
          customElement: 'ajaxcart-header',
          className: AjaxCartHeader
        },
        {
          customElement: 'ajaxcart-item',
          className: AjaxCartItem
        }
      ];
    }
  
    initEvents() {
      this.previousElementSibling.addEventListener('click', this.close);
      this.querySelector('ajaxcart-header button')?.addEventListener('click', this.close);
    }
  
    open(isCartRefreshRequire = true){
      // Does't allow body to scroll
      document.body.classList.add('overflow-hidden');
      this.closest('.ajaxcart-content').setAttribute('open',"");
  
      // Refresh cart only if required
      if(isCartRefreshRequire) this.refreshCart();
    }
  
    close(){
      // Allow body to scroll
      document.body.classList.remove('overflow-hidden');
      this.closest('.ajaxcart-content').removeAttribute('open');
    }
  
    refreshCart(cartElement = false ) {
      // TODO: Add loading state
      if(!cartElement){
        fetch("/cart?view=ajaxcart")
        .then((response) => response.text())
        .then((responseText) => {
          this.appendNewCart(responseText);
        });
      } else {
        this.appendNewCart(cartElement);
      }
    }
  
    appendNewCart(cartElement){
      const html = new DOMParser().parseFromString(cartElement, 'text/html');
      const source = html.querySelector('.ajaxcart-content');
      const destination = this.closest('.ajaxcart-content');
  
      if (source && destination){
        // Adding time out for better animation
        // Increase timeout if there is lag in the animation
        setTimeout(function(){
          destination.innerHTML = source.innerHTML;
        },100);
      }
    }
  }
  
  // To Do something extra on the header link to make a carousal on the header
  class AjaxCartHeader extends HTMLElement {
    constructor() {
      super();
    }
  }
  
  class AjaxCartItem extends HTMLElement {
    constructor() {
      super();
  
      this.quantityInput = this.querySelector('quantity-input');
      this.removeButton = this.querySelector('.ajaxcart--remove');
      this.ajaxCartElement = this.closest('ajax-cart');
      this.quantityInput?.addEventListener("change", this.onQuantityChange.bind(this));
      this.removeButton.addEventListener("click", this.onRemoveItem.bind(this));
    }
  
    onRemoveItem(e) {
      e.preventDefault();
  
      let event = new Event('change');
      this.quantityInput.querySelector('input').value = 0;
      this.quantityInput.dispatchEvent(event);
    }
  
    onQuantityChange() {
      // TODO: Check For max quantity reached
      // TODO: Initialize loading so customer does't increase quantity faster than ajax call can be made.
  
      const quantity = this.quantityInput.querySelector('input').value;
      const itemKey = this.dataset['itemkey'];
  
      // Make config for fetch
      const config = fetchConfig('javascript');
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      delete config.headers['Content-Type'];
  
      // Make data to submit
      const formData = new FormData();
      formData.append('id',itemKey);
      formData.append('quantity',quantity);
      formData.append('sections','ajaxcart');
      formData.append('sections_url',"/cart?view=ajaxcart");
  
      config.body = formData;
  
      fetch(`${routes.cart_change_url}`, config)
      .then((response) => response.json())
      .then((response) => {
        if (response.status) {
          this.handleErrorMessage(response.description);
          return;
        }
  
        this.ajaxCartElement.refreshCart(response?.sections['ajaxcart']);
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        // TODO: Hide Loading
      });
    }
  
    handleErrorMessage(errorMessage = false) {
      // TODO: Handle Error Message
    }
  }
  
export default AjaxCart;