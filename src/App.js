import React, {useState} from 'react';
import './App.css';
import Overview from './js/Overview';
import Languages from './js/Languages';
import Repositories from './js/Repositories';
import {gql, useQuery}from "@apollo/client";
import croix from './img/croix.png';

const DATA = gql`
    query { 
        viewer {
            name
            login
            company
            location
            bio
            avatarUrl
            updatedAt
            followers{
                totalCount
            }
            following{
                totalCount
            }
            repositories(first:2){
                totalCount
                edges {
                    node {
                        name
                        owner{
                            login
                        }
                        resourcePath
                        description
                        updatedAt
                        collaborators{
                            totalCount
                        }
                        languages(first:10){
                            edges{
                                node{
                                    name
                                    color
                                }
                            }
                        }
                        updatedAt
                        defaultBranchRef {
                            target {
                                ... on Commit {
                                    tree{
                                        entries{
                                          extension
                                          name
                                        }
                                    }
                                    signature{
                                        isValid
                                    }
                                    history {
                                        totalCount
                                        edges {
                                            node {
                                                additions
                                                deletions
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;

function fermePopup() {
    document.getElementById('popup').classList.add('ferme_popup')
}

function ProfilInfo() {
  const { loading, error, data } = useQuery(DATA);
  const [value, setValue] = useState();
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;
    let nb_commits = data.viewer.repositories.edges.map((edge) => (parseInt(edge.node.defaultBranchRef.target.history.totalCount, 10)));
    let additions = data.viewer.repositories.edges.map((edge) => (
        edge.node.defaultBranchRef.target.history.edges.map((edge) => (
            edge.node.additions
        ))
    )).flat();
    let deletions = data.viewer.repositories.edges.map((edge) => (
        edge.node.defaultBranchRef.target.history.edges.map((edge) => (
            edge.node.deletions
        ))
    )).flat();
    const reducer = (previousValue, currentValue) => previousValue + currentValue;
    let nb_lignes = parseInt(additions.reduce(reducer)) - parseInt(deletions.reduce(reducer));
    nb_commits = nb_commits.reduce(reducer);
    const refresh = ()=>{
        // it re-renders the component
        console.log(value)
        setValue({});
    }

  return(
    <div>
        <div className="popup" id="popup">
            <p>Did you know? <span>You can add statisctics from your private repos to your profile</span></p>
            <img src={croix} alt="croix" onClick={fermePopup}/>
        </div>
        <section className="summary">
            <div className="share">
                <p>Share your profile on:</p>
                <a href="">LinkedIn</a>
                <a href="">Twitter</a>
                <a href="">Facebook</a>
                <a href="">Get HTML</a>
                <i className="fas fa-pen"></i>
            </div>
            <div className="section_title">
                <h2>{data.viewer.name}</h2>
                <p>{data.viewer.bio} at {data.viewer.company}.<br/>
                {data.viewer.location}</p>
                <p>1</p>
            </div>
            <div className="section_content summary_content">
                <div>
                    <p>{data.viewer.login}</p>
                    <img src={data.viewer.avatarUrl} alt="Profil"/>
                </div>
                <p>Commits <br/><span>{nb_commits}</span></p>
                <p>Repos <br/><span>{data.viewer.repositories.totalCount}</span></p>
                <p>Lines of code <br/>{nb_lignes}</p>
                <p>Followers <br/><span>{data.viewer.followers.totalCount}</span></p>
                <p>Following <br/><span>{data.viewer.following.totalCount}</span></p>
                <p><button onClick={refresh}>Refresh</button><br/></p>
            </div>
        </section>
    </div>
  )
}
function App() {
    return (
      <div className="body">
        <ProfilInfo />
        <Overview />
        <Languages />
        <Repositories />
      </div>
    );
  }

export default App;