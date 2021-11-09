import '../App.css';
import {
    gql,
    useQuery,
}from "@apollo/client";

const DATA = gql`
    query { 
        viewer {
            updatedAt
            repositories(first:2){
                totalCount
                edges{
                    node{
                        name
                        nameWithOwner
                        description
                        updatedAt
                        languages(first:3){
                            edges{
                                node{
                                    name
                                    color
                                }
                            }
                        }
                        collaborators{
                            totalCount
                        }
                        defaultBranchRef{
                            target{
                                ... on Commit{
                                    signature{
                                        isValid
                                    }
                                    history{
                                        totalCount
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

function Repositories() {
    const { loading, error, data } = useQuery(DATA);
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error :(</p>;
        let verif = data.viewer.repositories.edges.map((edge) => (
            edge.node.defaultBranchRef.target.signature.isValid
        ));
        console.log(verif)
        
    return(
        <div>
            <section>
                <div className="section_title">
                    <h2>Repositories</h2>
                    <p>{data.viewer.repositories.totalCount} repos<br/>
                    Last updated : {data.viewer.updatedAt}</p>
                    <p>6</p>
                </div>
                <div className="section_content">
                    <div>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Repository</th>
                                <th>Commits</th>
                                <th>Team</th>
                                <th>Language</th>
                                <th>Timeline</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.viewer.repositories.edges.map((edge, index) => (
                            <tr>
                                <td>{index+1}</td>
                                <td>
                                    <b>{edge.node.name}</b><br/>
                                    {edge.node.description}<br/>
                                    {edge.node.nameWithOwner}
                                    {edge.node.languages.edges.map((edge) => (
                                        <div className="lang_overview">
                                            {edge.node.name}
                                            <div className="lang_couleur" style={{backgroundColor: edge.node.color}}></div>
                                        </div>
                                    ))}
                                    {edge.node.defaultBranchRef.target.signature.isValid}
                                </td>
                                <td>{edge.node.defaultBranchRef.target.history.totalCount}</td>
                                <td>{edge.node.collaborators.totalCount}</td>
                                <td>{edge.node.languages.edges[0].node.name}<div className="lang_couleur" style={{backgroundColor: edge.node.languages.edges[0].node.color}}></div></td>
                                <td>*Graphic*</td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Repositories;