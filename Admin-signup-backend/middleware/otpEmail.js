// HTML content for the email body
const HtmlPage = `
<!doctype html>
<html lang="en">


<style>
  p {

      color: #0f172a;
      font-size: 18px;
      line-height: 29px;
      font-weight: 400;
      margin: 8px 0 16px;

  }

  h1 {
      color: #5566e5;
      font-weight: 700;
      font-size: 40px;
      line-height: 44px;
      margin-bottom: 4px;
  }

  h2 {
      color: #1b235c;
      font-size: 100px;
      font-weight: 400;
      line-height: 120px;
      margin-top: 40px;
      margin-bottom: 40px;
  }

  .container {
      text-align: center;
  }
</style>

<body>
  <header>
      <!-- place navbar here -->
  </header>
  <main>

      <div class="container ">
          <h1> Welcome to PMS </h1>
          <p>To continue enter this confirmation code:</p>
          <h2> ${otp}</h2>
          <h5>"Welcome to "SNP Tax & Financials", where tax management meets simplicity. Our advanced software
              streamlines tax processes for individuals, businesses, and professionals, ensuring accuracy and
              efficiency. Experience a new era of financial ease with SNP Tax & Financials."</h5>
      </div>

  </main>

</body>

</html>`;
export default HtmlPage;
