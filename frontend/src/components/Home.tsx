import { Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../styles/Home.scss";

export default function Component() {
  const navigate = useNavigate();

  return (
    <Container
      fluid
      className="d-flex flex-column min-vh-100 text-light bg-dark"
      style={{ position: "relative" }}
    >
      <main className="flex-grow-1 d-flex flex-column align-items-center pt-5 mt-4">
        <div className="text-center">
          <h1
            className="display-6 text-theme mb-4"
            style={{ fontFamily: "var(--font-satoshi-sans)" }}
          >
            ZK Proof Demo
          </h1>

          <div className="position-relative d-flex align-items-center justify-content-center mb-5">
            <div className="position-relative">
              <img
                src="/images/Frame 1983.svg"
                alt="twitter"
                width={75}
                height={75}
                className="text-dark position-absolute"
                style={{ left: "-50px" }} // Positioning the first image to the left
              />
              <img
                src="/images/Frame 1984.svg"
                alt="Concordium logo"
                width={75}
                height={75}
                className="text-secondary"
              />
            </div>
          </div>

          <div>
            <h2
              className="h4 text-start text-theme mb-3"
              style={{ fontFamily: "var(--font-satoshi-sans)" }}
            >
              ZK Proof Types:
            </h2>
            <ol
              className="text-start ps-3"
              style={{
                fontFamily: "var(--font-satoshi-sans)",
                fontSize: "14px",
                fontWeight: 400,
              }}
            >
              <li className="mb-3">Reaveal a field from your passport</li>
              <li className="mb-3">
                Proof your older than 18 years (range proof)
              </li>
              <li className="mb-3">
                Proof your nationality is eligible (set membership proof)
              </li>
            </ol>
          </div>

          {/* Get Started Button */}
          <div className="d-flex justify-content-center mt-5 mb-3">
            {" "}
            {/* Flex container to center the button */}
            <Button
              onClick={(e) => {
                navigate("/connectWallet");
              }}
              variant="light"
              className="px-5 py-3 rounded-pill bg-white text-black fw-semibold"
              style={{ width: "239px", height: "56px" }}
            >
              Get started
            </Button>
          </div>
        </div>
      </main>
    </Container>
  );
}
