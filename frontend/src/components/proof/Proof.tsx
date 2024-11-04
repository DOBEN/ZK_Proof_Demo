import React, { useRef, useState } from 'react';

import BackButton from '../elements/BackButton';
import '../../styles/ConnectWallet.scss';
import '../../styles/ProgressStep.scss';
import '../../styles/Proof.scss';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Row, Col } from 'react-bootstrap';

import { Check } from "lucide-react";
import SkeletonLoading from './Skeleton';
import { useWallet } from '../../context/WalletContext';
import { getRecentBlock } from '../../utils';
import { AccountAddress, AtomicStatementV2, ConcordiumGRPCClient, CredentialDeploymentValues, CredentialStatement } from '@concordium/web-sdk';
import { Buffer } from 'buffer';

import { CONTEXT_STRING } from '../../constants';
import sha256 from 'sha256';
import { GrpcWebFetchTransport } from '@protobuf-ts/grpcweb-transport';
interface ProgressStepProps {
    number: number;
    active: boolean;
}

/// 1. Proof: Reveal attribute proof ("nationalIdNo" attribute).
/// 2. Proof: Reveal attribute proof ("nationality" attribute).
/// 3. Proof: Range proof ("dob=dateOfBirth" attribute). User is older than 18 years.
/// 4. Proof: Not set membership proof ("countryOfResidence" attribute). User is not from the USA or North Korea.
/// Countries are represented by 2 letters (ISO 3166-1 alpha-2).
const ZK_STATEMENTS = [
    {
        "type": "RevealAttribute",
        "attributeTag": "nationalIdNo"
    },
    {
        "type": "RevealAttribute",
        "attributeTag": "nationality"
    },
    {
        "type": "AttributeInRange",
        "attributeTag": "dob",
        "lower": "18000101",
        "upper": "20060802"
    },
    {
        "type": "AttributeNotInSet",
        "attributeTag": "countryOfResidence",
        "set": [
            "US", "KP"
        ]
    }
] as AtomicStatementV2[];

const ProgressStep: React.FC<ProgressStepProps> = ({ number, active }) => (
    <div className="progress-step d-flex align-items-center">
        <div
            className={`step-circle d-flex align-items-center justify-content-center ${active ? 'active' : 'inactive'
                }`}
        >
            {number}
        </div>
        {number < 3 && (
            <div
                className={`step-line ${active ? 'active' : 'inactive'
                    }`}
            />
        )}
    </div>
);

const Proof = () => {
    const navigate = useNavigate();
    const { provider, connectedAccount } = useWallet();
    const grpcClient = useRef(new ConcordiumGRPCClient(new GrpcWebFetchTransport({ baseUrl: CONFIG.node }))).current;

    const [verifyProgress, setVerifyProgress] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const [successfulSubmission, setSuccessfulSubmission] = useState<boolean | undefined>(undefined);
    const [IdNumber, setIdNumber] = useState<string | undefined>(undefined);
    const [nationality, setNationality] = useState<string | undefined>(undefined);

    const handleVerify = async () => {
        setIsLoading(true);
        // setTimeout(() => {
        //     setIsLoading(false);
        //     setVerifyProgress(true);
        // }, 1000);


        setError(undefined);
        setSuccessfulSubmission(undefined);

        try {
            // if (!zkStatement) {
            //     throw Error(`'zkStatement' is undefined.`);
            // }

            if (!provider || !connectedAccount) {
                throw Error(
                    `'provider' or 'prover' are undefined. Connect your wallet. Have an account in your wallet.`,
                );
            }

            const { blockHash: recentBlockHash, blockHeight: recentBlockHeight } = await getRecentBlock(grpcClient);

            const digest = [recentBlockHash.buffer, Buffer.from(CONTEXT_STRING)];
            // The zk proof request here is non-interactive (we don't request the challenge from the backend).
            // Instead the challenge consists of a recent block hash (so that the proof expires)
            // and a context string (to ensure the ZK proof cannot be replayed on different Concordium services).
            const challenge = sha256(digest.flatMap((item) => Array.from(item)));

            // Generate the ZK proof.
            const credentialStatement: CredentialStatement = {
                idQualifier: {
                    type: 'cred',
                    // We allow all identity providers on mainnet and on testnet.
                    // This list is longer than necessary to include all current/future
                    // identity providers on mainnet and testnet.
                    issuers: [0, 1, 2, 3, 4, 5, 6, 7],
                },
                statement: ZK_STATEMENTS
            };
            const presentation = await provider.requestVerifiablePresentation(challenge, [credentialStatement]);
            setVerifyProgress(true);
            setIsLoading(false);

            const accountInfoProver = await grpcClient?.getAccountInfo(AccountAddress.fromBase58(connectedAccount));
            const credIdConnectedAccount = (
                accountInfoProver?.accountCredentials[0].value.contents as CredentialDeploymentValues
            ).credId;

            // Check that the ZK proof was generated by the account address that is connected to this dApp.
            if (
                credIdConnectedAccount !==
                presentation.verifiableCredential[0].credentialSubject.id.replace(
                    /did:ccd:(mainnet|testnet):cred:/g,
                    '',
                )
            ) {
                throw Error(
                    `When approving the ZK proof in the wallet, select your connected account from the drop-down menu in the wallet (expect proof for account: ${connectedAccount}).`,
                );
            }

            setIdNumber( presentation.verifiableCredential[0].credentialSubject.proof.proofValue[0].attribute)
             setNationality(presentation.verifiableCredential[0].credentialSubject.proof.proofValue[1].attribute)

            // TODO: verify ZK proof
            // await submitZkProof(presentation, recentBlockHeight);

            setSuccessfulSubmission(true);

        } catch (error) {
            setError((error as Error).message);
            setIsLoading(false);
        }
    };
    return (
        <Container fluid className="d-flex flex-column min-vh-100 text-light bg-dark" style={{ position: 'relative' }}>
            {isLoading ? (
                <>
                <SkeletonLoading />
                {error && <p className="text-red-500 text-center">{error}</p>}
                </>
            ) : (
                <>
                    <div className="d-flex align-items-center">
                        <BackButton redirectURL={'/connectWallet'} />
                        <Button onClick={async (e) => {
                            const account: any = connectedAccount
                            await navigator.clipboard.writeText(account);
                            if (CONFIG.network === "testnet") {
                                window.open(`https://testnet.ccdscan.io/?dcount=1&dentity=account&daddress=${connectedAccount}`, "_blank")
                            } else {
                                window.open(`https://ccdscan.io/?dcount=1&dentity=account&daddress=${connectedAccount}`, "_blank")
                            }
                        }} variant="primary" className="ms-auto mt-2 account-button text-black bg-theme">
                            {connectedAccount
                                ? connectedAccount.slice(0, 5) + '...' + connectedAccount.slice(-5)
                                : 'No Account Connected'}
                        </Button>
                    </div>
                    <div className="d-flex justify-content-center mb-3">
                        <ProgressStep number={1} active={true} />
                        <ProgressStep number={2} active={true} />
                        <ProgressStep number={3} active={false} />
                    </div>
                    <Container className="connect-wallet-container text-center pt-2">
                        <h1 className="connect-wallet-title">Proof of eligibility</h1>
                        <div className="verification-container mb-5">
                            {verifyProgress ? (
                                <Container className="user-info-container w-339 space-y-2">
                                    <Row>
                                        <Col>
                                            <p className="label-text">Nationality</p>
                                            <p className="info-text border-bottom">{nationality}</p>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <p className="label-text">Passport number</p>
                                            <p className="info-text border-bottom">{IdNumber}</p>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col>
                                            <p className="label-text">Age</p>
                                            <div className="d-flex align-items-center border-bottom">
                                                <Check size={20} className="text-green mr-2" />
                                                <p className="info-text mt-3">Over 18 years old</p>
                                            </div>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col>
                                            <p className="label-text mt-2">Your country</p>
                                            <div className="d-flex align-items-center border-bottom">
                                                <Check size={20} className="text-green mr-2" />
                                                <p className="info-text">Eligible nationality</p>
                                            </div>
                                        </Col>
                                    </Row>

                                </Container>
                            ) : (
                                <div className="w-full">
                                    <p className="text-gray-300 text-[12px] font-normal font-satoshi-sans mb-[8px]">
                                        To collect your reward, you must verify the below data
                                        <br /> using your ConcordiumID.
                                    </p>

                                    <ul className="space-y-2 text-gray-300">
                                        <li className="verification-list-item">
                                            <span className="bullet"></span>
                                            Your Nationality
                                        </li>
                                        <li className="verification-list-item">
                                            <span className="bullet"></span>
                                            Your ID number
                                        </li>
                                        <li className="verification-list-item">
                                            <span className="bullet"></span>
                                            That you are over 18 years old
                                        </li>
                                        <li className="verification-list-item">
                                            <span className="bullet"></span>
                                            That your nationality is eligible *
                                        </li>
                                    </ul>


                                    <p className="note-text text-[12px] font-normal pt-[29px] text-gray-400 font-satoshi-sans">
                                        * Not eligible nationalities are: USA, Iran, North Korea,
                                        occupied regions of Ukraine.
                                    </p>
                                </div>
                            )}
                        </div>

                    </Container>
                    <div className="d-flex justify-content-center mb-3"> {/* Flex container to center the button */}
                        {verifyProgress ?
                            <Button
                                onClick={(e) => {
                                    navigate('/submission')
                                }}
                                variant="light"
                                className="px-5 py-3 rounded-pill bg-white text-black fw-semibold"
                                style={{ width: "239px", height: "56px" }}
                            >
                                Finish
                            </Button>
                            :
                            <Button
                                onClick={(e) => {
                                    handleVerify()
                                }}
                                variant="light"
                                className="px-5 py-3 rounded-pill bg-white text-black fw-semibold"
                                style={{ width: "239px", height: "56px" }}
                            >
                                Verify
                            </Button>
                        }
                           {error && <p className="text-red-500 text-center">{error}</p>}
                    </div>
                </>
            )}
        </Container>
    );
};

export default Proof;
