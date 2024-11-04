import { Button, Container } from "react-bootstrap";
import "../../styles/Submission.scss";
import pictureCodeExample from "../../../public/images/ZKProof.png";
import { useNavigate } from "react-router-dom";

export default function DevExample() {
  const navigate = useNavigate();
  return (
    <Container
      fluid
      className="d-flex flex-column min-vh-100 text-light bg-dark"
      style={{ position: "relative" }}
    >
      <main className="flex-grow-1 d-flex flex-column align-items-center pt-5 mt-4">
        <div className="text-center">
          <h6
            className="display-6 text-theme mb-4"
            style={{ fontFamily: "var(--font-satoshi-sans)" }}
          >
            How to generate
          </h6>
          <h6
            className="display-6 text-theme mb-4"
            style={{ fontFamily: "var(--font-satoshi-sans)" }}
          >
            a ZK proof?
          </h6>

          <li className="mb-3">No special ZK language needed</li>
          <li className="mb-3">
            Proof generation is built into the wallet
          </li>

          <div className="position-relative d-flex align-items-center justify-content-center mb-5">
            <div className="position-relative">
              <img
                src={pictureCodeExample}
                alt="Concordium logo"
                width="100%"
                height={350}
                className="text-secondary"
              />
            </div>
          </div>

          {/* Get Started Button */}
          <div className="d-flex justify-content-center mt-5 mb-3">
            {" "}
            {/* Flex container to center the button */}
            <Button
              onClick={() => {
                navigate("/finalPage");
              }}
              variant="light"
              className="px-5 py-3 rounded-pill bg-white text-black fw-semibold"
              style={{ width: "239px", height: "56px" }}
            >
              Connect To Concordium
            </Button>
          </div>
        </div>
      </main>
    </Container>
  );
}
